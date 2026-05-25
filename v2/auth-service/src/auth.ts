import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { findOrCreateUser, getUserById } from './db';

export function configurePassport() {
  // Serialize user ID into session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser((id: number, done: any) => {
    try {
      const user = getUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'placeholder') {
    passport.use(new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: 'http://localhost:3003/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const user = findOrCreateUser({
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value || '',
            provider: 'google',
            providerId: profile.id,
          });
          done(null, user);
        } catch (err) {
          done(err as Error, undefined);
        }
      }
    ));
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'placeholder') {
    passport.use(new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: 'http://localhost:3003/auth/github/callback',
      },
      (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const user = findOrCreateUser({
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            name: profile.displayName || profile.username,
            avatar: profile.photos?.[0]?.value || '',
            provider: 'github',
            providerId: profile.id,
            githubToken: accessToken,
          });
          done(null, user);
        } catch (err) {
          done(err, undefined);
        }
      }
    ));
  }
}
