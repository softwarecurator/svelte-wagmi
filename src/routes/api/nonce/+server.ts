import { error, json } from '@sveltejs/kit';
import { generateNonce } from 'siwe';

/** @type {import('./[username]').RequestHandler} */
export async function GET() {
	try {
		//You should get the nonce from the user
		return json(generateNonce());
	} catch (err: any) {
		return error(500, err.message);
	}
}
