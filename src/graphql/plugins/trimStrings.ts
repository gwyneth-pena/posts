export const TrimStringsPlugin: {} = {
  requestDidStart() {
    return {
      didResolveOperation({ request }) {
        if (request.variables) {
          function deepTrim(obj: any) {
            for (const key in obj) {
              if (typeof obj[key] === "string") {
                obj[key] = obj[key].trim();
              } else if (typeof obj[key] === "object" && obj[key] !== null) {
                deepTrim(obj[key]);
              }
            }
          }
          deepTrim(request.variables);
        }
      },
    };
  },
};
