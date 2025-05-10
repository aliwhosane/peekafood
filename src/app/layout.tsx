import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PeekAFood - AI Calorie Counter',
  description: 'Upload a photo of your meal and get an AI-powered calorie breakdown.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
