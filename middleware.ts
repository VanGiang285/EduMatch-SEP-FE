import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // FORCE LOG - This should ALWAYS appear
  console.log('🚨🚨🚨 MIDDLEWARE EXECUTING FOR:', pathname);
  console.log('🚨🚨🚨 Request URL:', request.url);
  console.log('🚨🚨🚨 All cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value}`));
  
  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/find-tutor',
    '/tutor', // Match /tutor/[id]
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/unauthorized',
    '/_next',
    '/api',
    '/favicon.ico',
  ];
  
  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('✅ Public route, allowing access:', pathname);
    return NextResponse.next();
  }
  
  // Protected routes with specific role requirements
  const protectedRoutes = {
    '/become-tutor': ['learner', 'tutor'], // Only learners and tutors
    '/system-admin': ['system_admin'], // Only system admin
    '/system-admin/dashboard': ['system_admin'],
    '/system-admin/users': ['system_admin'],
    '/system-admin/tutors': ['system_admin'],
    '/system-admin/reviews': ['system_admin'],
    '/system-admin/settings': ['system_admin'],
    '/business-admin': ['business_admin'], // Only business admin
    '/business-admin/dashboard': ['business_admin'],
    '/business-admin/users': ['business_admin'],
    '/business-admin/tutors': ['business_admin'],
    '/business-admin/reviews': ['business_admin'],
    '/business-admin/settings': ['business_admin'],
  };
  
  // Check if current path requires protection
  const requiredRoles = Object.entries(protectedRoutes)
    .find(([route]) => pathname.startsWith(route))?.[1];
  
  if (requiredRoles) {
    console.log('🔒 Route is protected:', pathname, 'Required roles:', requiredRoles);
    
    // Get authentication data from cookies
    const accessToken = request.cookies.get('accessToken')?.value || 
                       request.cookies.get('token')?.value ||
                       request.cookies.get('authToken')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    
    console.log('🍪 Auth check:', {
      accessToken: accessToken ? 'exists' : 'missing',
      userRole: userRole || 'missing',
      allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
    });
    
    // Check authentication
    if (!accessToken || !userRole) {
      console.log('❌ Not authenticated, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user role is allowed
    if (!requiredRoles.includes(userRole as never)) {
      console.log('❌ Role not allowed, redirecting to unauthorized');
      console.log('❌ User role:', userRole, 'Required roles:', requiredRoles);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    console.log('✅ Access granted for role:', userRole);
  } else {
    console.log('✅ Route not protected, allowing access');
  }
  
  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (all Next.js internal assets and HMR)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next|favicon.ico).*)',
  ],
};

