((system_command_call_content) @injection.content
  (#set! injection.language "bash"))

((exec_system_command_call_expression (single_quoted_string) @injection.content)
  (#set! injection.language "bash"))

((exec_system_command_call_expression (double_quoted_string) @injection.content)
  (#set! injection.language "bash"))
