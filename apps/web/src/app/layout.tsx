import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ScamSquatch - Secure Cross-Chain Swaps',
  description: 'AI-powered protection against scam routes, fake bridges, and honeypots.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased dark:bg-[#020817] dark:text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}