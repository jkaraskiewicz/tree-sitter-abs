/**
 * @file Parser for Abs (abs-lang.org)
 * @author Jacek Karaskiewicz <jacek.karaskiewicz@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "abs",

  word: $ => $.identifier,

  extras: $ => [
    $._whitespace,
    $.line_comment,
  ],

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $._statement,
      $._expression_statement,
      $._function_declaration,
    ),

    _expression_statement: $ => $._expression,

    literal: $ => choice(
      $.string,
      $.number,
      $.array,
      $.hash,
      $.boolean,
      $.nil,
    ),

    boolean: $ => choice('true', 'false'),
    nil: $ => 'nil',

    string: $ => choice(
      seq(
        '\'',
        $.single_quoted_string,
        '\'',
      ),
      seq(
        '"',
        $.double_quoted_string,
        '"',
      ),
    ),

    single_quoted_string: $ => token.immediate(/(?:[^']|\\')*/),
    double_quoted_string: $ => token.immediate(/(?:[^"]|\\")*/),

    number: $ => {
      const digit = /\d/;
      const digits = repeat1(digit);
      const optional_digits = repeat(digit);

      return token(choice(
        seq(digits, optional(seq('_', digits))), // Basic integers with optional underscores
        seq(digits, '.', optional_digits, optional(seq('e', optional(choice('+', '-')), digits))), // Floats
        seq(digits, optional(seq('e', optional(choice('+', '-')), digits))), // Integers with exponent (e.g., 1e3)
      ));
    },

    array: $ => seq(
      '[',
      optional($._arguments_list),
      ']',
    ),

    hash: $ => seq(
      '{',
      optional($._hash_keyvalue_pairs_list),
      '}',
    ),

    _hash_keyvalue_pair: $ => seq(
      $.string,
      ':',
      $._expression,
    ),

    _hash_keyvalue_pairs_list: $ => seq(
      $._hash_keyvalue_pair,
      repeat(
        seq(
          ',',
          $._hash_keyvalue_pair,
        ),
      ),
      optional(','), // Allow trailing comma
    ),

    // _expression is now the entry point for all expressions
    _expression: $ => choice(
      $._expression_base, // Literals, identifiers, function calls, etc.
      $.unary_expression,
      $.binary_expression,
      $.member_expression, // Property access (e.g., obj.prop) and indexed access (e.g., arr[0])
      $.call_expression, // Function calls
      $.anonymous_function, // Anonymous function as an expression
      $.range_expression, // For '..' operator
    ),

    _expression_base: $ => choice(
      $.literal,
      $.identifier,
      $.parenthesized_expression,
    ),

    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    call_expression: $ => prec.left(16, choice( // High precedence for function calls
      $.function_call_expression,
      $.system_command_call_expression,
    )),

    member_expression: $ => prec.left(15, seq( // High precedence for member access
      $._expression, // Can be any expression that evaluates to an object/array
      choice(
        seq('.', $.identifier), // Property access
        seq('?.', $.identifier), // Optional chaining property access
        seq('[', $._expression, ']'), // Indexed access (array/hash)
      ),
    )),

    unary_expression: $ => prec.left(14, seq( // Unary ops
      choice('!', '!!'),
      $._expression,
    )),

    // Binary expressions, ordered by precedence (highest to lowest)
    // Precedence values are arbitrary, as long as they are consistent relative to each other.
    // Use prec.left for left-associative, prec.right for right-associative.

    binary_expression: $ => choice(
      // Power (right-associative)
      prec.right(13, seq($._expression, '**', $._expression)),
      // Multiplication, Division, Modulo (left-associative)
      prec.left(12, seq($._expression, choice('*', '/', '%'), $._expression)),
      // Addition, Subtraction (left-associative)
      prec.left(11, seq($._expression, choice('+', '-'), $._expression)),
      // Bitwise Shift (left-associative)
      prec.left(10, seq($._expression, choice('>>', '<<'), $._expression)),
      // Bitwise AND (left-associative)
      prec.left(9, seq($._expression, '&', $._expression)),
      // Bitwise XOR (left-associative)
      prec.left(8, seq($._expression, '^', $._expression)),
      // Bitwise OR (left-associative)
      prec.left(7, seq($._expression, '|', $._expression)),
      // Comparisons (non-associative or chainable depending on language)
      prec.left(6, seq($._expression, choice('>', '>=', '<', '<=', '<=>'), $._expression)),
      // Equality (non-associative)
      prec.left(5, seq($._expression, choice('==', '!='), $._expression)),
      // 'in' and '!in' (usually same precedence as equality)
      prec.left(5, seq($._expression, choice('in', '!in'), $._expression)),
      // Logical AND (left-associative)
      prec.left(4, seq($._expression, '&&', $._expression)),
      // Logical OR (left-associative)
      prec.left(3, seq($._expression, '||', $._expression)),
    ),

    // Range operator '..' (often lower than arithmetic, higher than assignment)
    range_expression: $ => prec.left(2, seq($._expression, '..', $._expression)),

    function_call_expression: $ => prec.left(16, seq( // Keep call prec high
      choice($.identifier, $.member_expression), // Can be identifier or prop access for method calls
      '(',
      optional($._arguments_list),
      ')',
    )),

    _arguments_list: $ => seq(
      $._expression,
      repeat(
        seq(
          ',',
          $._expression,
        ),
      ),
      optional(','), // Allow trailing comma
    ),

    system_command_call_expression: $ => choice(
      $.quoted_system_command_call_expression,
      $.exec_system_command_call_expression,
      $.dollared_system_command_call_expression,
    ),

    exec_system_command_call_expression: $ => seq(
      'exec',
      '(',
      choice(
        seq(
          '\'',
          $.single_quoted_string,
          '\'',
        ),
        seq(
          '"',
          $.double_quoted_string,
          '"',
        ),
      ),
      ')',
    ),

    quoted_system_command_call_expression: $ => seq(
      '`',
      $.system_command_call_content,
      '`',
    ),

    dollared_system_command_call_expression: $ => seq(
      '$',
      token.immediate('('), // Use token.immediate for fixed string that needs to be part of the token
      token.immediate(/[^$()]+/), // Be careful with `[^$()]+`, ensure it doesn't try to match the closing `)`
      token.immediate(')'),
    ),

    system_command_call_content: $ => token.immediate(/[^`]*/),

    _function_declaration: $ => choice(
      $.named_function_declaration,
    ),

    named_function_declaration: $ => seq(
      optional($.annotation),
      'f',
      $.identifier,
      '(',
      optional($._parameters_list),
      ')',
      $.block,
    ),

    annotation: $ => seq(
      '@',
      $.identifier,
      optional(
        seq(
          '(',
          optional($._arguments_list),
          ')',
        ),
      ),
    ),

    anonymous_function: $ => seq(
      'f',
      '(',
      optional($._parameters_list),
      ')',
      $.block,
    ),

    _parameter: $ => seq(
      $.identifier,
      optional(
        seq(
          '=',
          $._expression,
        ),
      ),
    ),

    _parameters_list: $ => seq(
      $._parameter,
      repeat(
        seq(
          ',',
          $._parameter,
        ),
      ),
      optional(','), // Allow trailing comma
    ),

    _statement: $ => choice(
      $.deferred_system_call,
      $.assignment_statement,
      $.if_statement,
      $.for_statement,
      $.return_statement,
      $.while_statement,
    ),

    deferred_system_call: $ => seq(
      'defer',
      $.system_command_call_expression,
    ),

    // Assignment as a statement:
    assignment_statement: $ => seq(
      $._lhs_target, // Left-hand side
      choice('=', '+=', '-=', '*=', '/=', '**=', '%='),
      $._expression,
    ),


    while_statement: $ => seq(
      'while',
      $._expression,
      $.block,
    ),

    return_statement: $ => seq(
      'return',
      $._expression,
    ),

    if_statement: $ => seq(
      'if',
      $._expression, // Condition is an expression
      $.block,
      repeat(
        seq(
          'else if',
          $._expression, // else if condition is an expression
          $.block,
        )
      ),
      optional(
        seq(
          'else',
          $.block,
        )
      ),
    ),

    for_statement: $ => seq(
      'for',
      choice(
        $.standard_for_clause,
        $.in_for_clause,
      ),
      $.block, // Block for the loop body
      optional(
        seq(
          'else',
          $.block,
        ),
      ),
    ),

    standard_for_clause: $ => prec.left(1, seq(
      optional($._statement), // Init statement (e.g., `i = 0;`)
      ';',
      optional($._expression), // Condition expression
      ';',
      optional($._statement), // Update statement (e.g., `i++;`)
    )),

    in_for_clause: $ => prec(10, seq(
      // Iteration variables can be a single identifier or multiple, maybe even destructuring
      seq(
        $.identifier, // First identifier
        repeat(
          seq(
            ',',
            $.identifier,
          ),
        ),
      ),
      'in',
      $._expression, // The iterable expression
    )),

    block: $ => seq(
      '{',
      repeat(
        $._definition,
      ),
      '}',
    ),

    // Left-hand side target for assignments and property/index access
    _lhs_target: $ => choice(
      $.identifier,
      $.bracketed_access, // Renamed from _bracketed_lhs for clarity
      $.property_access,  // Renamed from _property_lhs for clarity
    ),

    // Rules for accessing properties/elements
    bracketed_access: $ => prec.left(16, seq( // High precedence for bracketed access
      $._expression, // This can be an identifier, or a property_access, etc.
      '[',
      $._expression,
      ']',
    )),

    property_access: $ => prec.left(15, seq( // High precedence for property access
      $._expression, // This can be an identifier, or a property_access
      '.',
      $.identifier,
    )),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    _whitespace: $ => /\s+/,

    line_comment: $ => token(seq('#', /.*/)),
  }
});
