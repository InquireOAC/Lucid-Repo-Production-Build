import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const OnboardingPreview = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserRole();

  if (isLoading) return null;
  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return <OnboardingFlow onComplete={() => navigate("/admin")} />;
};

export default OnboardingPreview;