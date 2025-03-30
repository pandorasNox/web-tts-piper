
// (async () => await new Promise(resolve => setTimeout(resolve, 500)))(); //inline
export default async function sleep(delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay))
}
