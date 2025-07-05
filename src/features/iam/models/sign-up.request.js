/**
 * Resource for sign up request payload
 */
export class SignUpRequest {
  /**
   * @param {string} ruc - RUC number
   * @param {string} legalName - Legal company name
   * @param {string} [commercialName] - Commercial name (optional)
   * @param {string} [address] - Company address (optional)
   * @param {string} [city] - City (optional)
   * @param {string} [country] - Country (optional)
   * @param {string} [tenantPhone] - Tenant phone number (optional)
   * @param {string} [tenantEmail] - Tenant email (optional)
   * @param {string} [website] - Company website (optional)
   * @param {string} username - Username for authentication
   * @param {string} password - Password for authentication
   * @param {string} email - User email
   * @param {string} [firstName] - User first name (optional)
   * @param {string} [lastName] - User last name (optional)
   * @param {string} [tenantType] - Tenant type (optional)
   */
  constructor(
    ruc,
    legalName,
    commercialName = null,
    address = null,
    city = null,
    country = null,
    tenantPhone = null,
    tenantEmail = null,
    website = null,
    username,
    password,
    email,
    firstName = null,
    lastName = null,
    tenantType = null
  ) {
    this.ruc = ruc;
    this.legalName = legalName;
    this.commercialName = commercialName;
    this.address = address;
    this.city = city;
    this.country = country;
    this.tenantPhone = tenantPhone;
    this.tenantEmail = tenantEmail;
    this.website = website;
    this.username = username;
    this.password = password;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.tenantType = tenantType;
  }
}
