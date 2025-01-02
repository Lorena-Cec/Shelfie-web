import React from "react";
import { useRouter } from "next/router";
import ProfileScreen from "@/modules/profilePage/screens/ProfileScreen";

const UserProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query;

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ProfileScreen userId={userId as string} />
    </div>
  );
};

export default UserProfilePage;
