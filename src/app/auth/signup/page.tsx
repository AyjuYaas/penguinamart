import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata = {
  title: "PudinaMart - Signup",
};

const Signup = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-[30rem] h-max flex flex-col gap-5 p-7 rounded-md border-2 shadow-2xl">
        <div className="text-4xl font-bold flex flex-col self-start mb-5">
          <span>Sign up</span>
          <span className="font-light">for PudinaMart</span>
        </div>

        <SignupForm />

        <div className="text-center">
          <span>Already have an account? </span>{" "}
          <Link href={"/auth/login"} className="underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;
