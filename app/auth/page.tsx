import AuthForm from "@/components/AuthForm"

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Authentication</h1>
      <AuthForm />
    </div>
  )
}

