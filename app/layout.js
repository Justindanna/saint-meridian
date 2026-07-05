import './globals.css';

export const metadata = {
  title: 'Saint Meridian',
  description: 'Black and white essentials by Saint Meridian.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
