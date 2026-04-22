import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getUserByEmail, createUser, sanitizeUser } from "../services/userService.js";

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("✅ Google Strategy - Callback triggered");
      console.log("Callback URL being used:", process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback');
      try {
        // Google se milne wali info
        const email = profile.emails[0]?.value;
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        const googleId = profile.id;
        const photoURL = profile.photos[0]?.value;

        // Check if user exists
        let user = await getUserByEmail(email);

        if (!user) {
          // Naya user create karo
          user = await createUser({
            fullName,
            email,
            password: null, // Google OAuth users don't have password
            googleId,
            photoURL,
            roleCategory: "support-circle", // Default role
            role: "family-member",
            roleLabel: "Family Member",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user (session mein store karne ke liye)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const { getUserById } = await import("../services/userService.js");
    const user = await getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;