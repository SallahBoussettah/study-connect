import React from 'react';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Computer Science Student",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "StudyConnect transformed how I prepare for exams. The collaborative features helped me connect with classmates and improved my grades significantly.",
    stars: 5
  },
  {
    name: "Michael Chen",
    role: "Engineering Major",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
    quote: "Finding study partners used to be challenging, but with StudyConnect I found a group that matches my learning style. The scheduling tool is a game-changer!",
    stars: 5
  },
  {
    name: "Priya Patel",
    role: "Pre-Med Student",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    quote: "The resource sharing feature is incredible. My study group can collaborate on notes even when we can't meet in person. Highly recommend!",
    stars: 4
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-secondary-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mt-2">
            What Our <span className="text-primary-600">Users Say</span>
          </h2>
          <p className="mt-4 text-xl text-secondary-600 max-w-3xl mx-auto">
            Join thousands of students who have transformed their study experience with StudyConnect.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full mr-4 object-cover"
                />
                <div>
                  <h3 className="font-semibold text-secondary-900">{testimonial.name}</h3>
                  <p className="text-secondary-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-secondary-700 italic flex-grow">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 
