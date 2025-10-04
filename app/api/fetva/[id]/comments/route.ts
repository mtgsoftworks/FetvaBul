import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as limitQuery,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const runtime = 'nodejs';

const COLLECTION = 'fetvaInteractions';
const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;

function getInteractionDocRef(fetvaId: string) {
  return doc(db, COLLECTION, fetvaId);
}

function serializeComment(docSnap: Awaited<ReturnType<typeof getDoc>>) {
  const data = docSnap.data() as Record<string, any> | undefined;
  if (!data) return null;

  let createdAt: string | null = null;
  const rawCreatedAt = data.createdAt as any;
  if (rawCreatedAt?.toDate) {
    createdAt = rawCreatedAt.toDate().toISOString();
  } else if (typeof rawCreatedAt?.seconds === 'number') {
    createdAt = new Date(rawCreatedAt.seconds * 1000).toISOString();
  }

  return {
    id: docSnap.id,
    name: data.name ?? 'Anonim',
    message: data.message ?? '',
    createdAt,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Geçersiz fetva ID' }, { status: 400 });
    }

    const limitParam = request.nextUrl.searchParams.get('limit');
    const limitValue = Number(limitParam);
    const limit = Number.isFinite(limitValue) && limitValue > 0 ? Math.min(limitValue, 50) : 20;

    const commentsRef = collection(getInteractionDocRef(id), 'comments');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'), limitQuery(limit));
    const snapshot = await getDocs(commentsQuery);

    const comments = snapshot.docs
      .map(docSnap => {
        const serialized = serializeComment(docSnap);
        return serialized ?? null;
      })
      .filter((comment): comment is NonNullable<typeof comment> => Boolean(comment));

    return NextResponse.json({ comments, success: true });
  } catch (error) {
    console.error('[comments.GET]', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

interface CreateCommentInput {
  name?: string;
  message?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Geçersiz fetva ID' }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as CreateCommentInput | null;
    const name = body?.name?.toString().trim() ?? 'Anonim';
    const message = body?.message?.toString().trim();

    if (!message || message.length < 3) {
      return NextResponse.json({ error: 'Yorum en az 3 karakter olmalı' }, { status: 400 });
    }

    const interactionRef = getInteractionDocRef(id);
    const commentsRef = collection(interactionRef, 'comments');

    const commentId = await runTransaction(db, async transaction => {
      const interactionSnap = await transaction.get(interactionRef);

      const newCommentRef = doc(commentsRef);
      const payload = {
        name: name.slice(0, MAX_NAME_LENGTH),
        message: message.slice(0, MAX_MESSAGE_LENGTH),
        createdAt: serverTimestamp(),
      };

      transaction.set(newCommentRef, payload);

      if (interactionSnap.exists()) {
        const current = interactionSnap.data().commentsCount ?? 0;
        transaction.update(interactionRef, {
          commentsCount: current + 1,
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(interactionRef, {
          likes: 0,
          commentsCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      return newCommentRef.id;
    });

    const newCommentSnapshot = await getDoc(doc(commentsRef, commentId));
    const commentData = serializeComment(newCommentSnapshot);

    return NextResponse.json({ comment: commentData, success: true });
  } catch (error) {
    console.error('[comments.POST]', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
