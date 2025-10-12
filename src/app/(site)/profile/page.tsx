"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the profile data
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        setUser(data.user);
      }
      catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false)
      }
    };

    checkUser();
  }, []);

  // Fetch the reviews of the user.
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/backend/reviews");
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        
        // Filter the data to just show the logged in user's
        const myReviews = data.reviews.filter((review: any) => review.mine === true);
        setReviews(myReviews);
        console.log("Reviews: ", myReviews)

      }
      catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false)
      }
    };

    fetchReviews();
  }, []);

  // Logs out the user
const handleLogout = async () => {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      // Redirect to the role selection page after logout
      router.replace("/login_signup");
    } else {
      console.error("Logout failed");
    }
  } catch (err) {
    console.error("Error during logout:", err);
  }
};

  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-xl text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">No user found</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-8 px-4">
      {/* Profile Card */}
      <div className="bg-base-100 rounded-2xl shadow-xl p-6 w-full max-w-md text-center">

        {/* Info */}
        <h2 className="text-2xl font-bold mb-2  text-green-500">Your Profile</h2>
        <p className="text-sm text-base-content/70 mb-1">
          Role: <span className="font-semibold text-base-content">{user.role}</span>
        </p>
        <p className="text-sm text-base-content/70 mb-1">
          Major: <span className="font-semibold text-base-content">{user.major}</span>
        </p>
        <p className="text-sm text-base-content/70 mb-4">
          Degree: <span className="font-semibold text-base-content">{user.graduationYear}</span>
        </p>
        <p className="text-sm text-base-content/70 mb-4">
          Graduation Year: <span className="font-semibold text-base-content">{user.graduationYear}</span>
        </p>
        {user && (
          <>
            {/* Employment Type */}
            <div className="text-sm text-base-content/70 mb-4">
              <span>Employment Type:</span>
              <div className="font-semibold text-base-content mt-1 flex justify-center flex-wrap gap-2">
                {user.workPreference.map((job: string, index: number) => (
                  <span key={index}>{job}</span>
                ))}
              </div>
            </div>

            {/* Work Authorization */}
            <div className="text-sm text-base-content/70 mb-4">
              <span>Work Authorization:</span>
              <div className="font-semibold text-base-content mt-1 flex justify-center flex-wrap gap-2">
                {user.workAuthorization.map((auth: string, index: number) => (
                  <span key={index}>{auth}</span>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="divider"></div>

        {/* Reviews Section */}
        <h3 className="text-2xl font-semibold text-green-500 mb-3 text-center">Reviews</h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-base-content/70">You haven't submitted any reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review, index) => (
              <li key={index} className="p-3 rounded-lg bg-base-200 hover:bg-base-300 transition">
                <div className="font-semibold text-base">{review.companyName}</div>
                <div className="text-sm text-base-content/70">“{review.comment}”</div>
              </li>
            ))}
          </ul>
        )}

        <div className="divider"></div>

        <div>
          <button
              className="btn mt-3 px-6 text-base font-semibold shadow-md
             bg-[#13AA52] hover:bg-[#0f8a43] text-white border-none"
            onClick={() => router.push("/studentUserInfo")}
          >
            Edit Profile
          </button>
        </div>

        <div>
          <button onClick={handleLogout} 
            className="btn mt-3 px-6 text-base font-semibold shadow-md
             bg-[#fc000d] hover:bg-[#980207] text-white border-none">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}