import React from 'react'

const Index = () => {
    return (
        <div className="w-1/2 hidden sm:flex flex-col items-center justify-center bg-[#5B718F]">
            <div className="text-white text-center mb-4">
                <h2 className="text-4xl font-bold">Welcome Back!</h2>
            </div>
            <p className="text-white text-center mb-4 w-2/3">
                Welcome to our platform! Navigate through the menu to access a wealth of learning resources and tools. From courses and tutorials to support and settings, everything you need is just a click away. Customize your experience and make the most of your time here.</p>
            <img
                src="assets/images/svgImage/login.svg"
                alt="Your Image"
                className="w-2/5 h-auto max-w-lg mt-48 mx-auto"
            />
        </div>
    )
}

export default Index