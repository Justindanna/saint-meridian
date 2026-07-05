import './globals.css';

export const metadata = {
  title: 'Saint Meridian',
  description: 'Premium black and white streetwear by Saint Meridian.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
