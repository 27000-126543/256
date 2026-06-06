import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Activity, User, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types';

interface LoginForm {
  username: string;
  password: string;
  role: UserRole;
}

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'patient', label: '患者', description: '预约检查、查看报告' },
  { value: 'doctor', label: '开单医生', description: '管理预约、标记加急' },
  { value: 'technician', label: '检查技师', description: '检查队列、上传报告' },
  { value: 'director', label: '科室主任', description: '设备监控、数据统计' },
  { value: 'admin', label: '院领导', description: '全局概览、运营报告' },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<LoginForm>({
    defaultValues: {
      username: '',
      password: '123456',
      role: 'patient',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: LoginForm) => {
    setError('');
    const success = await login(data.username, data.password, data.role);
    
    if (success) {
      const from = (location.state as { from?: Location })?.from?.pathname || `/${data.role}`;
      navigate(from, { replace: true });
    } else {
      setError('用户名或密码错误，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full opacity-20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
              医技检查预约平台
            </h1>
            <p className="text-center text-gray-500 mb-8">
              多院区一体化检查预约与报告管理
            </p>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">选择身份</p>
              <div className="grid grid-cols-5 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => register('role').onChange({ target: { value: role.value } })}
                    className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedRole === role.value
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {roles.find((r) => r.value === selectedRole)?.description}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  账号
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('username', { required: '请输入账号' })}
                    type="text"
                    placeholder="请输入手机号/工号/姓名"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('password', { required: '请输入密码' })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-danger-500 bg-danger-50 p-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
              >
                {isSubmitting ? '登录中...' : '登 录'}
              </button>
            </form>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>演示账号：</strong>输入对应角色的姓名即可登录，密码：123456
                <br />
                例如：张三（患者）、王医生（医生）、陈技师（技师）、周主任（主任）、吴院长（院领导）
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
