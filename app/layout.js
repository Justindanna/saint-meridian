import './globals.css';

export const metadata = {
  title: 'Saint Meridian',
  description: 'Official drop by Saint Meridian.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
