import { error, json } from '@sveltejs/kit';
import { SiweMessage } from 'siwe';

export async function POST({ request }: any) {
	try {
		const { message, signature } = await request.json();
		const siweMessage = new SiweMessage(message);
		const fields = await siweMessage.validate(signature);

		//Grab users nonce from DB and address and make sure they match
		if (!fields.nonce) {
			return json({ ok: false });
		}

		return json({ ok: true });
	} catch (err: any) {
		return error(500, err.message);
	}
}
