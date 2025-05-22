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
      $._expression,
      $._function_declaration,
    ),

    literal: $ => choice(
      $.string,
      $.number,
      $.array,
      $.hash,
    ),

    string: $ => choice(
      seq(
        '\'',
        /[^']*/,
        '\'',
      ),
      seq(
        '"',
        /[^"]*/,
        '"',
      ),
    ),

    number: $ => choice(
      /\d+/, // integer
      seq( // float
        /\d+/,
        '.',
        /\d+/,
      ),
      seq( // with underscores
        repeat(
          seq(
            /\d+/,
            '_',
          ),
        ),
        /\d+/,
      ),
      seq( // exponential
        /\d+/,
        'e',
        optional(choice('+', '-')),
        /\d+/,
      ),
    ),

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
    ),

    _operator: $ => choice(
      $.unary_operator,
      $.property_operator,
      $.binary_operator,
      $.bitwise_operator,
    ),

    unary_operator: $ => choice(
      '!',
      '!!',
    ),

    property_operator: $ => choice(
      '.',
      '?.',
    ),

    binary_operator: $ => choice(
      '==',
      '!=',
      '+',
      '+=',
      '-',
      '-=',
      '*',
      '*=',
      '/',
      '/=',
      'in',
      '!in',
      '**',
      '**=',
      '%',
      '%=',
      '>',
      '>=',
      '<',
      '<=',
      '<=>',
      '&&',
      '||',
      '~',
      '..',
    ),

    bitwise_operator: $ => choice(
      '&',
      '|',
      '^',
      '>>',
      '<<',
    ),

    _function_call: $ => choice(
      $._standard_function_call,
      $._system_command_call,
    ),

    _standard_function_call: $ => seq(
      $.identifier,
      '(',
      optional($._arguments_list),
      ')',
    ),

    _arguments_list: $ => seq(
      $._expression,
      repeat(
        seq(
          ',',
          $._expression,
        ),
      ),
    ),

    _system_command_call: $ => choice(
      $._quoted_system_command_call,
      $._dollared_system_command_call,
    ),

    _quoted_system_command_call: $ => seq(
      '`',
      /[^`]*/,
      '`',
    ),

    _dollared_system_command_call: $ => seq(
      '$(',
      /[^$()]+/,
      ')',
    ),

    _function_declaration: $ => choice(
      $._named_function_declaration,
      $._anonymous_function_declaration,
    ),

    _named_function_declaration: $ => seq(
      'f',
      $.identifier,
      '(',
      optional($._parameters_list),
      ')',
      $.block,
    ),

    _anonymous_function_declaration: $ => seq(
      'f',
      '(',
      $._parameters_list,
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
    ),

    _statement: $ => choice(
      $._deferred_system_call,
      $._assignment_statement,
      $._if_statement,
      $._for_statement,
      $._return_statement,
      $._while_statement,
    ),

    _deferred_system_call: $ => seq(
      'defer',
      $._system_command_call,
    ),

    _assignment_statement: $ => seq(
      $._lhs,
      '=',
      $._expression,
    ),

    _while_statement: $ => seq(
      'while',
      $._expression,
      $.block,
    ),

    _return_statement: $ => seq(
      'return',
      $._expression,
    ),

    _if_statement: $ => seq(
      'if',
      $._expression,
      $.block,
      repeat(
        seq(
          'else if',
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

    _for_statement: $ => seq(
      choice(
        $._standard_for_statement,
        $._in_for_statement,
      ),
      optional(
        seq(
          'else',
          $.block,
        ),
      ),
    ),

    _standard_for_statement: $ => seq(
      'for',
      optional($._statement),
      ';',
      optional($._expression),
      ';',
      optional($._statement),
      $.block,
    ),

    _in_for_statement: $ => seq(
      'for',
      seq(
        $.identifier,
        repeat(
          seq(
            ',',
            $.identifier,
          ),
        ),
      ),
      'in',
      $._expression,
      $.block,
    ),

    block: $ => seq(
      '{',
      repeat(
        $._statement,
      ),
      '}',
    ),

    _expression: $ => choice(
      seq(
        '(',
        $._expression,
        ')',
      ),
      $.literal,
      $._function_call,
      $._lhs_atom,
      seq(
        $.unary_operator,
        $._expression,
      ),
      seq(
        $._expression,
        $.binary_operator,
        $._expression,
      ),
      seq(
        $._expression,
        $.bitwise_operator,
        $._expression,
      ),
      $._anonymous_function_declaration,
    ),

    _lhs_atom: $ => choice(
      $.identifier,
      $._bracketed_lhs,
      $._property_lhs,
    ),

    _lhs: $ => seq(
      $._lhs_atom,
      repeat(
        seq(
          ',',
          $._lhs_atom,
        ),
      ),
    ),

    _bracketed_lhs: $ => seq(
      $.identifier,
      '[',
      $._expression,
      ']',
    ),

    _property_lhs: $ => seq(
      $.identifier,
      '.',
      $.identifier,
      repeat(
        seq(
          '.',
          $.identifier,
        ),
      ),
    ),

    identifier: $ => /\w[\w_-]+/,

    _whitespace: $ => /\s+/,

    line_comment: $ => token(seq('//', /.*/)),
  }
});
