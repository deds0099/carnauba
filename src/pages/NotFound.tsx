
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-5xl font-bold text-farm-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        <Button variant="default" asChild>
          <a href="/">Voltar para o Dashboard</a>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
