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
