export interface DecodedToken {
  id: number;
  username: string;
  iat?: number; // issued at
  exp?: number; // expiration
}