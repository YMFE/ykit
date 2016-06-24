define(['./module1.js', './module2.js'], function(m1, m2) {
    document.write("<h1>require following modules1:</h1>")
    m1()
    m2()
})
