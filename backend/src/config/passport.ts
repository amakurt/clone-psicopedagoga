import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import prisma from '../lib/prisma';

const configurePassport = () => {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Email não fornecido pelo Google'));
          }

          const existingSocialAccount = await prisma.socialAccount.findUnique({
            where: {
              provider_providerId: {
                provider: 'google',
                providerId: profile.id
              }
            }
          });

          if (existingSocialAccount) {
            const user = await prisma.user.findUnique({
              where: { id: existingSocialAccount.userId }
            });
            if (user) {
              return done(null, user);
            }
          }

          let user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.displayName || email.split('@')[0],
                email,
                role: 'PSICOPEDAGOGO',
                avatarUrl: profile.photos?.[0]?.value
              }
            });
          }

          await prisma.socialAccount.create({
            data: {
              userId: user.id,
              provider: 'google',
              providerId: profile.id,
              accessToken,
              refreshToken
            }
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    ));
  }
};

export default configurePassport;
