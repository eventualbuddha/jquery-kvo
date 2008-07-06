Dim AccessorGeneratorCounter
AccessorGeneratorCounter = 0

Class AccessorGenerator
  Dim myself, getters, setters, defines
  
  Public Sub Class_Initialize()
    getters = Array()
    setters = Array()
    defines = Array()
  End Sub
  
  Public Property Get count
    AccessorGeneratorCounter = AccessorGeneratorCounter + 1
    count = AccessorGeneratorCounter
  End Property
  
  Public Function getter(name, fn)
    ReDim Preserve getters(UBound(getters) + 1)
    getters(UBound(getters)) = Array(name, fn)
  End Function
  
  Public Function setter(name, fn)
    ReDim Preserve setters(UBound(setters) + 1)
    setters(UBound(setters)) = Array(name, fn)
  End Function
  
  Public Function define(name, fn, argc)
    ReDim Preserve defines(UBound(defines) + 1)
    defines(UBound(defines)) = Array(name, fn, argc)
  End Function
  
  Public Property Get self
    Set self = myself
  End Property
  
  Public Property Set self(value)
    Set myself = value
  End Property
  
  Public Function create(self, fn)
    Dim S, C, args
    
    C = count
    
    S = ""
    S = S & "Class GeneratedClassForAccessors" & C & vbCrLf
    S = S & "  Private getterList" & vbCrLf
    S = S & "  Private setterList" & vbCrLf
    S = S & "  Private defineList" & vbCrLf
    S = S & "  Private myself" & vbCrLf
    S = S & "  Public Property Let getters(value)" & vbCrLf
    S = S & "    getterList = value" & vbCrLf
    S = S & "  End Property" & vbCrLf
    S = S & "  Public Property Let setters(value)" & vbCrLf
    S = S & "    setterList = value" & vbCrLf
    S = S & "  End Property" & vbCrLf
    S = S & "  Public Property Let defines(value)" & vbCrLf
    S = S & "    defineList = value" & vbCrLf
    S = S & "  End Property" & vbCrLf
    S = S & "  Public Property Get self" & vbCrLf
    S = S & "    Set self = myself" & vbCrLf
    S = S & "  End Property" & vbCrLf
    S = S & "  Public Property Set self(value)" & vbCrLf
    S = S & "    Set myself = value" & vbCrLf
    S = S & "  End Property" & vbCrLf
    
    fn.call(self)
    
    For i = LBound(getters) To UBound(getters)
      S = S & "  Public Property Get " & getters(i)(0) & vbCrLf
      S = S & "    " & getters(i)(0) & " = getterList(" & i & ")(1).call(myself)" & vbCrLf
      S = S & "  End Property" & vbCrLf
    Next
    
    For i = LBound(setters) To UBound(setters)
      S = S & "  Public Property Let " & setters(i)(0) & "(newvalue)" & vbCrLf
      S = S & "    setterList(" & i & ")(1).call myself, newvalue" & vbCrLf
      S = S & "  End Property" & vbCrLf
    Next
    
    For i = LBound(defines) To UBound(defines)
      args = ""
      For a = 1 To defines(i)(2)
        args = args & "arg" & a
        If a <> defines(i)(2) Then
          args = args & ", "
        End If
      Next
      
      S = S & "  Public Function " & defines(i)(0) & "(" & args & ")" & vbCrLf
      If defines(i)(2) = 0 Then
        args = "myself"
      Else
        args = "myself, " & args
      End If
      S = S & "    " & defines(i)(0) & " = defineList(" & i & ")(1).call(" & args & ")" & vbCrLf
      S = S & "  End Function" & vbCrLf
    Next
    
    S = S & "End Class" & vbCrLf
    
    ' MsgBox S
    
    ExecuteGlobal(S)
    
    Dim obj
    
    Set obj = Eval("New GeneratedClassForAccessors" & C)
    obj.getters = getters
    obj.setters = setters
    obj.defines = defines
    Set obj.self = obj
    
    Set create = obj
  End Function
End Class

Class VBScriptAccessorBuilder
  Public Function build(fn)
    Dim ag
    Set ag = New AccessorGenerator
    Set ag.self = ag
    Set build = ag.create(ag, fn)
  End Function
End Class

Dim VBScriptAccessorBuilderInstance
Set VBScriptAccessorBuilderInstance = New VBScriptAccessorBuilder
