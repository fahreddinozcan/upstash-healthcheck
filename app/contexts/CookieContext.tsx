// import React, { createContext } from "react";
// import { Redis } from "@upstash/redis";
// import { cookies } from "next/headers";

// interface RateContextProps {
//   sessionToken: any;
// }
// const RateContext = createContext<RateContextProps>({
//   sessionToken: "",
// });

// export const CookieProvider: any = ({ children }: { children: any }) => {
//   const cookieStore = cookies();
//   let sessionToken = cookieStore.get("session_token");

//   if (!sessionToken) {
//     sessionToken = (Date.now() - Math.random() * 10).toString() as any;
//   }
//   return (
//     <RateContext.Provider
//       value={{
//         sessionToken,
//       }}
//     >
//       {children}
//     </RateContext.Provider>
//   );
// };

// export default RateContext;
