export function load({ url }) {
  const targetUrl = url.searchParams.get('url');
  const decodedUrl = targetUrl ? decodeURIComponent(targetUrl) : null;
  
  return {
    decodedUrl
  };
}