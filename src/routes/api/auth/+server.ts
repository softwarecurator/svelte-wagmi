import { error, json } from '@sveltejs/kit';

/** @type {import('./[username]').RequestHandler} */
export async function GET() {
	try {
		//Check for auth with your own auth system
		return json({ok: true});
	} catch (err: any) {
		return error(500, err.message);
	}
}
