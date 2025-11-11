// src/application/use-cases/LogoutUser.ts
/** Logout is stateless – we just clear the cookie on the client side.
 *  No business logic required, but we keep a use-case for consistency. */
export class LogoutUser {
  execute(): { message: string } {
    return { message: "Logged out" };
  }
}
