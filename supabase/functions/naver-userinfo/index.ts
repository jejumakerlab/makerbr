// 네이버 로그인용 userinfo 중계 함수 (Supabase Edge Function, Deno)
// 네이버는 사용자 정보를 { response: { ... } } 로 감싸서 돌려주므로,
// Supabase Auth 가 읽을 수 있는 표준 OIDC 형식으로 풀어 줍니다.
//
// 배포: supabase functions deploy naver-userinfo --no-verify-jwt
// (네이버 access token 을 받으므로 Supabase JWT 검증을 꺼야 합니다.)

const NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

Deno.serve(async (request: Request) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const naverResponse = await fetch(NAVER_USERINFO_URL, {
    headers: { Authorization: authorization },
  });
  if (!naverResponse.ok) {
    return Response.json(
      { error: "Failed to fetch user info from Naver" },
      { status: naverResponse.status },
    );
  }

  const { response: profile } = await naverResponse.json();
  if (!profile?.id) {
    return Response.json({ error: "Invalid Naver profile" }, { status: 502 });
  }

  return Response.json({
    sub: profile.id,
    email: profile.email,
    email_verified: Boolean(profile.email),
    name: profile.name,
    nickname: profile.nickname,
    picture: profile.profile_image,
    phone_number: profile.mobile,
  });
});
