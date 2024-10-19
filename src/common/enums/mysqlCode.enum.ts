export enum MySqlErrorCode {
    ER_DUP_ENTRY = 1062, // Entrada duplicada
    ER_NO_DEFAULT_FOR_FIELD = 1364, // No hay valor predeterminado para el campo
    ER_ROW_IS_REFERENCED_2 = 1451, // La fila está referenciada por otra tabla
    ER_NO_REFERENCED_ROW_2 = 1452, // La fila referenciada no existe
    ER_DATA_TOO_LONG = 1406, // Datos demasiado largos
    ER_BAD_NULL_ERROR = 1048, // Columna no puede ser nula
    ER_ROW_IS_REFERENCED = 1217, // La fila está referenciada por otra tabla
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD = 1366, // Valor truncado incorrectamente
    ER_PARSE_ERROR = 1064, // Error de sintaxis
    ER_WRONG_FIELD_WITH_GROUP = 1055, // Campo incorrecto con grupo
    ER_NO_SUCH_TABLE = 1146, // La tabla no existe
    ER_WRONG_VALUE_COUNT_ON_ROW = 1136, // Número de valores incorrecto en la fila
    ER_WRONG_TYPE_FOR_VAR = 1232, // Tipo incorrecto para la variable
    ER_WRONG_DB_NAME = 1102, // Nombre de base de datos incorrecto
    ER_WRONG_TABLE_NAME = 1103, // Nombre de tabla incorrecto
    ER_UNKNOWN_TABLE = 1109, // Tabla desconocida
    ER_FIELD_SPECIFIED_TWICE = 1110, // Campo especificado dos veces
    ER_ILLEGAL_REFERENCE = 1247, // Referencia ilegal
    ER_CANT_DO_THIS_DURING_AN_TRANSACTION = 1179, // No se puede hacer esto durante una transacción
    ER_READ_ONLY_TRANSACTION = 1207, // Transacción de solo lectura
    ER_NO_REFERENCED_ROW = 1216, // No hay fila referenciada
    ER_DUP_KEY = 1022, // Clave duplicada
  }