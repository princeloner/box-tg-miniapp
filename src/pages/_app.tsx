import type { AppProps } from 'next/app';
import { TonProvider } from '../providers/TonProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TonProvider>
      <Component {...pageProps} />
    </TonProvider>
  );
}

export default MyApp; 