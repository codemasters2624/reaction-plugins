/**
 * @name Unit/socialMetadata
 * @method
 * @memberof Unit/GraphQL
 * @summary Combines all social data for a unit into single array
 * @param {Object} unit - Unit response from parent resolver
 * @returns {Object[]}  array of social media objects
 */
export default async function tags(unit) {
  const {
    facebookMsg = "",
    googleplusMsg = "",
    pinterestMsg = "",
    twitterMsg = "",
  } = unit;

  const socialMediaMessages = [
    {
      message: facebookMsg,
      service: "facebook",
    },
    {
      message: googleplusMsg,
      service: "googleplus",
    },
    {
      message: pinterestMsg,
      service: "pinterest",
    },
    {
      message: twitterMsg,
      service: "twitter",
    },
  ];

  return socialMediaMessages;
}
