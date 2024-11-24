'use server'

import connectDB from '@/lib/db'
import User from '@/models/User'
import { hash, compare } from 'bcrypt'

/**
 * Validate name
 */
function validateName(name) {
  if (name.length < 3) {
    return 'Name must be at least 3 characters long'
  }
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return 'Name can only contain letters and spaces'
  }
  return null
}

/**
 * Validate email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }
  if (email.length < 10) {
    return 'Email should be at least 10 characters long'
  }
  return null
}

/**
 * Validate password
 */
function validatePassword(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return errors.length > 0 ? errors.join(', ') : null
}

/**
 * Register a new user
 */
export async function registerUser(formData) {
  try {
    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Get form data
    const name = formData.get('name')?.trim()
    const email = formData.get('email')?.trim().toLowerCase()
    const password = formData.get('password')

    console.log('Received registration data:', { name, email });

    // Check if all fields are provided
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return {
        error: 'Missing required fields'
      }
    }

    // Validate name
    const nameError = validateName(name)
    if (nameError) {
      console.log('Name validation failed:', nameError);
      return {
        error: nameError
      }
    }

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      console.log('Email validation failed:', emailError);
      return {
        error: emailError
      }
    }

    // Validate password
    const passwordError = validatePassword(password)
    if (passwordError) {
      console.log('Password validation failed:', passwordError);
      return {
        error: passwordError
      }
    }

    console.log('Checking for existing user...');
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('User already exists with email:', email);
      return {
        error: 'Email already registered'
      }
    }

    console.log('Hashing password...');
    // Hash password
    const hashedPassword = await hash(password, 10)

    console.log('Creating new user in database...');
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    console.log('User created successfully:', { userId: user._id });

    return {
      success: true,
      message: 'User registered successfully'
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      error: 'Failed to register user'
    }
  }
}

/**
 * Login user
 */
export async function loginUser(formData) {
  try {
    console.log('Attempting to login...');
    await connectDB();

    const email = formData.get('email')?.trim().toLowerCase()
    const password = formData.get('password')

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing login credentials');
      return {
        error: 'Missing required fields'
      }
    }

    // Find user
    console.log('Finding user...');
    const user = await User.findOne({ email })
    if (!user) {
      console.log('User not found');
      return {
        error: 'Invalid email or password'
      }
    }

    // Verify password
    console.log('Verifying password...');
    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      console.log('Invalid password');
      return {
        error: 'Invalid email or password'
      }
    }

    console.log('Login successful for user:', user._id);
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(), // Convert ObjectId to string
        name: user.name,
        email: user.email
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      error: 'Failed to login'
    }
  }
}

/**
 * Reset password request
 */
export async function requestPasswordReset(formData) {
  try {
    console.log('Password reset requested');
    await connectDB();

    const email = formData.get('email')?.trim().toLowerCase()

    if (!email) {
      return {
        error: 'Email is required'
      }
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      console.log('No user found for password reset:', email);
      return {
        error: 'No account found with this email'
      }
    }

    // TODO: Implement password reset email functionality
    console.log('Password reset initiated for:', email);
    return {
      success: true,
      message: 'Password reset instructions sent to your email'
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      error: 'Failed to process password reset request'
    }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(formData) {
  try {
    console.log('Profile update requested');
    await connectDB();

    const userId = formData.get('userId')
    const name = formData.get('name')?.trim()
    const email = formData.get('email')?.trim().toLowerCase()
    const currentPassword = formData.get('currentPassword')
    const newPassword = formData.get('newPassword')

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      console.log('User not found for profile update:', userId);
      return {
        error: 'User not found'
      }
    }

    // Verify current password if provided
    if (currentPassword) {
      const passwordMatch = await compare(currentPassword, user.password)
      if (!passwordMatch) {
        console.log('Invalid current password for profile update');
        return {
          error: 'Current password is incorrect'
        }
      }
    }

    // Update user data
    if (name) {
      const nameError = validateName(name)
      if (nameError) {
        return {
          error: nameError
        }
      }
      user.name = name
    }

    if (email) {
      const emailError = validateEmail(email)
      if (emailError) {
        return {
          error: emailError
        }
      }
      user.email = email
    }

    if (newPassword) {
      const passwordError = validatePassword(newPassword)
      if (passwordError) {
        return {
          error: passwordError
        }
      }
      user.password = await hash(newPassword, 10)
    }

    await user.save()
    console.log('Profile updated successfully for user:', userId);

    return {
      success: true,
      message: 'Profile updated successfully'
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      error: 'Failed to update profile'
    }
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(formData) {
  try {
    console.log('Account deletion requested');
    await connectDB();

    const userId = formData.get('userId')
    const password = formData.get('password')

    if (!password) {
      return {
        error: 'Password is required to delete account'
      }
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      console.log('User not found for deletion:', userId);
      return {
        error: 'User not found'
      }
    }

    // Verify password
    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      console.log('Invalid password for account deletion');
      return {
        error: 'Incorrect password'
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId)
    console.log('Account deleted successfully:', userId);

    return {
      success: true,
      message: 'Account deleted successfully'
    }
  } catch (error) {
    console.error('Account deletion error:', error);
    return {
      error: 'Failed to delete account'
    }
  }
}