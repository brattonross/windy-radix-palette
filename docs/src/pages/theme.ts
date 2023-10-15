import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
	const formData = await request.formData();
	const theme = formData.get("theme");
	return new Response(null, {
		headers: {
			"Set-Cookie":
				theme && ["light", "dark"].includes(theme.toString())
					? `wrp_theme=${theme}; Path=/; HttpOnly; Max-Age=31536000; SameSite=Strict; Secure`
					: "wrp_theme=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict; Secure",
		},
	});
};
