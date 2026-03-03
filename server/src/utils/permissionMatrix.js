const DEFAULT_PERMISSION_MATRIX = {
  admin: { view: true, edit: true, delete: true, refund: true },
  receptionist: { view: true, edit: true, delete: false, refund: false },
  accountant: { view: true, edit: false, delete: false, refund: false },
  doctor: { view: true, edit: true, delete: false, refund: false },
  patient: { view: false, edit: false, delete: false, refund: false },
};

function normalizeMatrix(input) {
  const roles = Object.keys(DEFAULT_PERMISSION_MATRIX);
  const matrix = {};

  for (const role of roles) {
    const source = input?.[role] || {};
    matrix[role] = {
      view: Boolean(source.view ?? DEFAULT_PERMISSION_MATRIX[role].view),
      edit: Boolean(source.edit ?? DEFAULT_PERMISSION_MATRIX[role].edit),
      delete: Boolean(source.delete ?? DEFAULT_PERMISSION_MATRIX[role].delete),
      refund: Boolean(source.refund ?? DEFAULT_PERMISSION_MATRIX[role].refund),
    };
  }

  return matrix;
}

module.exports = {
  DEFAULT_PERMISSION_MATRIX,
  normalizeMatrix,
};
