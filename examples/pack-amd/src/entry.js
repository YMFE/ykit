define(['./module1.js', './module2.js'], function(m1, m2) {
    document.write("<h2>require following modules1:</h2>")
    m1()
    m2()
})
