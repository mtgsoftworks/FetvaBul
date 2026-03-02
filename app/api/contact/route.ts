import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const runtime = 'nodejs';

const CONTACT_COLLECTION = 'contactMessages';

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function sanitize(value: string | undefined | null, maxLength: number) {
  if (!value) return '';
  return value.toString().trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as ContactPayload | null;
    if (!body) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const name = sanitize(body.name, 120) || 'Anonim';
    const email = sanitize(body.email, 200);
    const subject = sanitize(body.subject, 150) || 'Konu belirtilmedi';
    const message = sanitize(body.message, 5000);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi giriniz' }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: 'Mesaj en az 10 karakter olmalı' }, { status: 400 });
    }

    const contactDoc = {
      name,
      email,
      subject,
      message,
      createdAt: serverTimestamp(),
      metadata: {
        ip: request.ip ?? request.headers.get('x-forwarded-for') ?? null,
        userAgent: request.headers.get('user-agent') ?? null,
        referrer: request.headers.get('referer') ?? null,
      },
    };

    await addDoc(collection(db, CONTACT_COLLECTION), contactDoc);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact.POST]', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
