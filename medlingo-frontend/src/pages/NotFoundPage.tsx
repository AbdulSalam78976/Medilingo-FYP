import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f1117] via-[#161b27] to-[#1a1f35] px-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-primary-container/8 rounded-full blur-3xl -translate-x-1/2" />

      <div className="relative text-center animate-fade-in max-w-md">
        <div className="text-8xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="font-heading text-headline-lg text-on-surface mb-4">
          Page Not Found
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
