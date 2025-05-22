; Literals
(string) @string
(number) @number
(boolean) @boolean
(nil) @constant.builtin

[
  ";"
  ":"
  ","
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(line_comment) @comment

(identifier) @variable
(annotation) @attribute
(function_call_expression (identifier) @function.call)
(member_expression (_) (identifier) @function.call)

; Operators
[
  "="
  "=="
  "!="
  "+"
  "+="
  "-"
  "-="
  "*"
  "*="
  "/"
  "/="
  "**"
  "**="
  "%"
  "%="
  ">"
  ">="
  "<"
  "<="
  "<=>"
  "&&"
  "||"
  "."
  "?."
  ".."
  "!"
  "!!"
  "&"
  "|"
  "^"
  ">>"
  "<<"
] @operator

; Keywords
[
  "if"
  "else"
] @keyword.conditional

[
  "for"
  "while"
] @keyword.repeat

[
  "in"
  "return"
  "defer"
  "!in"
] @keyword

"f" @keyword.function

(exec_builtin_command) @function.builtin

(function_call_expression
  (identifier) @function.builtin
  (#any-of? @function.builtin
    "arg" "args" "cd" "echo" "env" "eval" "exec" "exit" "flag" "len" "map"
    "pwd" "rand" "require" "sleep" "sort" "source" "stdin" "type" "unix_ms"))
