field = [1..10*16].map -> 0
background = [1..10*16].map -> 10+~~(Math.random()*10)
shapes = ["xxxx", "xx\nxx", "_x_\nxxx", "x__\nxxx", "__x\nxxx", "xx_\n_xx", "_xx\nxx"]

to_xy = (position) ->
  x: position%10
  y: ~~(position/10)

rect = (canvas, position, w, h, color) ->
  context = canvas.getContext("2d")
  p = to_xy(position)
  context.fillStyle = "##{color}"
  context.fillRect(p.x*20, p.y*20, w, h)

brick = (canvas, shape, position) ->
  pos = position
  for panel in shape
    rect(canvas, pos, 20, 20, "ff0000") if panel is "x"
    switch panel
      when "x", "_" then pos += 1
      when "\n" then pos += 10 - shape.indexOf("\n")

rotate = (shape, angle) ->
  return shape if angle is 0
  if shape.length is 4
    return shape if shape.indexOf("\n") is 2
    return shape if angle%2 is 0
    return shape.split("").join("\n")

  rotate_order = [2, 5, 1, 4, 0, 3]
  reordered = shape.split("").filter (p) -> p isnt "\n"

  if angle is 1
    reordered = reordered.map (p, i) ->
      reordered[rotate_order[i]]

  reordered = reordered.reverse() if angle > 1
  ret = []
  for p, i in reordered
    ret.push(p)
    # FIXME: Something is wrong here ...
    ret.push("\n") if (angle%2 isnt 0 and i%2 is 1) or (angle%2 is 0 and i%2 is 1)
  console.log(ret)
  ret.join("")

main_loop = (canvas)->
  canvas.width = 20*10
  canvas.height = 20*16
  for color, pos in background
    rect(canvas, pos, 20, 20, "#{color}#{color}#{color}")
  brick(canvas, rotate(shapes[3], 2), 3)

main_loop(document.getElementById('c'))
