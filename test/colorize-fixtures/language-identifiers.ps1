#region Valid - csharp

#region Valid - csharp - @'

$yes = <# csharp #>@'
    1 + 1
'@;

$yes = <#csharp#>@'
    1 + 1
'@;

$yes = <#csharp#>   @'
    1 + 1
'@;

$yes = <#               csharp                 #>@'
    1 + 1
'@;

$yes = <#               csharp                 #>                    @'
    1 + 1
'@;

#endregion Valid - csharp - @'

#region Valid - csharp - @"

$yes = <# csharp #>@"
    1 + 1
"@;

$yes = <#csharp#>@"
    1 + 1
"@;

$yes = <#csharp#>   @"
    1 + 1
"@;

$yes = <#               csharp                 #>@"
    1 + 1
"@;

$yes = <#               csharp                 #>                    @"
    1 + 1
"@;

#endregion Valid - csharp - @"

#endregion Valid - csharp - 

#region Invalid - csharp - 

#region Invalid - csharp - @'

$no = <# csharp #>
@'
    1 + 1
'@;

$no = <# csharp something #>@'
    1 + 1
'@;

$no = <# csharpomething #>@'
    1 + 1
'@;

$no = <# something csharp #>@'
    1 + 1
'@;

#endregion Invalid - csharp - @'

#region Invalid - csharp - @"

#endregion Invalid - csharp - @"

#endregion Invalid - csharp - 
