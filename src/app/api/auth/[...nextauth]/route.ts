// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth"; // Import the NextAuth module
import KeycloakProvider from "next-auth/providers/keycloak";

// api call to refresh the access token
// function requestRefreshOfAccessToken(token: JWT) {
//   return fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       client_id: process.env.KEYCLOAK_CLIENT_ID,
//       client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
//       grant_type: "refresh_token",
//       refresh_token: token.refreshToken!,
//     }),
//     method: "POST",
//     cache: "no-store",
//   });
// }

export const authOptions: AuthOptions = {
  providers: [
    // credentials from keycloak
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
