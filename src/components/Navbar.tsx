import { Link } from "wouter";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  return (
    <nav className="bg-[#BC4749] text-[#F2E8CF] p-5">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          JumboBoxd
        </Link>
        <div className="space-x-4">
          <SignedOut>
            <SignInButton>
              <button className="hover:text-gray-300">Log In</button>
            </SignInButton>
            <SignUpButton>
              <button className="hover:text-gray-300">Sign Up</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          {/* <Link href="/" className="hover:text-gray-300">
            Sign Up
          </Link>
          <Link href="/users/me" className="hover:text-gray-300">
            Log In
          </Link> */}
        </div>
      </div>
    </nav>
  );
};

// is it recommended to set tailwind format/structure in a separate file? like fonts, color theme, etc.
//tailwind.config.js

export default Navbar; 