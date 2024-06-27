'use server';

import * as auth from '@/auth';

export async function signIn(){
    // sign in with github oath provider
    return auth.signIn('github');
}

export async function signOut(){
    return auth.signOut();
}