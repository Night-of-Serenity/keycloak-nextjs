# NextJS-Keycloak

reference [NextJS-Keycloak medium](https://medium.com/inspiredbrilliance/implementing-authentication-in-next-js-v13-application-with-keycloak-part-1-f4817c53c7ef)

## Step 1: Setup a keycloak server

1. run terminal
   `docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:22.0.4 start-dev`

2. open <http://localhost:8080> and login with username: admin password: admin
3. create realm
4. create client

## Step 2: Setup NextJS with NextAuth

1. create nextjs app
   `npx create-next-app@13.5.4`
2. install next-auth
   `npm install next-auth@4.24.3`

## Step 3: Configure the authOptions with KeycloakProvider for next-auth and initialize route handler.

1. set api route with nextauth for keycloak path 'src/app/api/auth/[...nextauth]/route.ts'

   ```typescript
   export const authOptions: AuthOptions = {
     providers: [
       KeycloakProvider({
         clientId: process.env.KEYCLOAK_CLIENT_ID,
         clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
         issuer: process.env.KEYCLOAK_ISSUER,
       }),
     ],
   };
   const handler = NextAuth(authOptions);
   export { handler as GET, handler as POST };
   ```

2. set env variable for keycloak

   ```KEYCLOAK_CLIENT_SECRET="<get from keycloak client page>"
   KEYCLOAK_ISSUER="http://localhost:8080/realms/myrealm"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="<random assign>"
   ```

## Step 4: Setup Basic React Server component

1. Modify src/app/page.tsx
2. Create the Login and Logout component

   ```console
   mkdir src/components && touch src/components/Login.tsx && touch src/components/Logout.tsx
   ```

3. Update Login and Logout componet code

## Step 5: Set up Refleshing access token

1.  modified token with account data

```typescript
// src/app/api/auth/[...nextauth]/route.ts
   async jwt({ token, account }) {
   if (account) {
     token.idToken = account.id_token
     token.accessToken = account.access_token
     token.refreshToken = account.refresh_token
     token.expiresAt = account.expires_at
   }
   return token
 }
```

2.  add accessToken in session

```typescript
  // src/app/api/auth/[...nextauth]/route.ts
     async session({ session, token }) {
     session.accessToken = token.accessToken
     return session
   }
```

4. Set up Api call to renew access token

   ```typescript
   // src/app/api/auth/[...nextauth]/route.ts
   function requestRefreshOfAccessToken(token: JWT) {
     return fetch(
       `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
       {
         headers: { "Content-Type": "application/x-www-form-urlencoded" },
         body: new URLSearchParams({
           client_id: process.env.KEYCLOAK_CLIENT_ID,
           client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
           grant_type: "refresh_token",
           refresh_token: token.refreshToken!,
         }),
         method: "POST",
         cache: "no-store",
       }
     );
   }
   ```

   ```typescript
   async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        return token
      }
      // we take a buffer of one minute(60 * 1000 ms)
      if (Date.now() < (token.expiresAt! * 1000 - 60 * 1000)) {
        return token
      } else {
        try {
          const response = await requestRefreshOfAccessToken(token)

          const tokens: TokenSet = await response.json()

          if (!response.ok) throw tokens

          const updatedToken: JWT = {
            ...token, // Keep the previous token properties
            idToken: tokens.id_token,
            accessToken: tokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + (tokens.expires_in as number)),
            refreshToken: tokens.refresh_token ?? token.refreshToken,
          }
          return updatedToken
        } catch (error) {
          console.error("Error refreshing access token", error)
          return { ...token, error: "RefreshAccessTokenError" }
        }
      }
    },
   ```

5. add SessionGuard and SessionProvider

## Step 6: Set up Federated Logout

1. make federerated-logout api 'src/app/api/auth/federated-logout/route.ts'
2. replace next-auth logout by federatedLogout 'src/components/Logout.tsx' and 'src/utils/federatedLogout.ts'
3.
