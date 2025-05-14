export class Employee {
  constructor({
    id,
    name,
    email,
    role = Employee.ROLES.OPERATOR,
    status = Employee.STATUS.ACTIVE,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static ROLES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    OPERATOR: 'operator'
  };

  static STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  };

  get isActive() {
    return this.status === Employee.STATUS.ACTIVE;
  }

  promoteTo(role) {
    if (Object.values(Employee.ROLES).includes(role)) {
      this.role = role;
    }
  }

  deactivate() {
    this.status = Employee.STATUS.INACTIVE;
  }
}

export default Employee;
