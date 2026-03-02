import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

export const runtime = 'nodejs';

const COLLECTION = 'fetvaInteractions';

function getInteractionDocRef(fetvaId: string) {
  return doc(db, COLLECTION, fetvaId);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Geçersiz fetva ID' }, { status: 400 });
    }

    const snapshot = await getDoc(getInteractionDocRef(id));
    const data = snapshot.exists() ? snapshot.data() : null;

    return NextResponse.json({
      likes: data?.likes ?? 0,
      commentsCount: data?.commentsCount ?? 0,
      success: true,
    });
  } catch (error) {
    console.error('[likes.GET]', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
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

    const body = await request.json().catch(() => null);
    const action = body?.action;

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }

    const delta = action === 'like' ? 1 : -1;

    const likes = await runTransaction(db, async transaction => {
      const docRef = getInteractionDocRef(id);
      const snapshot = await transaction.get(docRef);
      const current = snapshot.exists() ? (snapshot.data().likes ?? 0) : 0;
      const next = Math.max(0, current + delta);

      if (snapshot.exists()) {
        transaction.update(docRef, {
          likes: next,
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(docRef, {
          likes: next,
          commentsCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return next;
    });

    return NextResponse.json({ likes, success: true });
  } catch (error) {
    console.error('[likes.POST]', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
