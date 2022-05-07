# react-draggable-provider

## Historical background

I've found that drag and transform require binding listener events in most cases. Bind mousemove、mouseup when mousedown，unbind mousemove、mouseup when mouseup。 So, I want to take that logic out of it.
